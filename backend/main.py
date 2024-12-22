import os
import time
import logging
from itertools import islice
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import requests
import json
from pdfminer.high_level import extract_text
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware after creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from the Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default paths
BASE_DIR = "data"
CV_DIR = os.path.join(BASE_DIR, "sample_cv")
JOBS_DIR = os.path.join(BASE_DIR, "sample_job")

# Ensure directories exist
os.makedirs(CV_DIR, exist_ok=True)
os.makedirs(JOBS_DIR, exist_ok=True)

# Global variables to store data
jobs_data = []
cv_data = {}

# Lightcast API credentials from environment variables
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
SCOPE = os.getenv("SCOPE")
TOKEN_URL = os.getenv("TOKEN_URL")
SKILLS_URL = os.getenv("SKILLS_URL")

# Global cache dictionary for token pooling
token_pool = []

# Function to generate and populate tokens
def populate_tokens(pool_size=5):
    global token_pool
    token_pool = []
    for _ in range(pool_size):
        payload = {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "grant_type": "client_credentials",
            "scope": SCOPE
        }
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        response = requests.post(TOKEN_URL, data=payload, headers=headers)

        if response.ok:
            token = response.json().get("access_token", "")
            token_pool.append(token)
        else:
            logging.error("Failed to generate token")

# Function to extract skills from document with a given token
def extract_skills_from_document_with_token(document_text, token):
    try:
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
        data = {"text": document_text}
        response = requests.post(SKILLS_URL, headers=headers, json=data)
        if response.ok:
            return response.json()
        else:
            logging.error(f"Failed to extract skills from document: {response.text}")
            return None
    except Exception as e:
        logging.error(f"Exception in extract_skills_from_document: {e}")
        return None

# Function to extract skill names
def extract_skill_names(api_response):
    return [skill.get('skill', {}).get('name') for skill in api_response.get('data', []) if skill.get('skill', {}).get('name')]

# Function to calculate Jaccard similarity
def jaccard_similarity(set1, set2):
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union else 0

# Function to process job descriptions concurrently
def extract_skills_concurrently(job_descriptions):
    global token_pool
    all_skills = []
    with ThreadPoolExecutor(max_workers=len(token_pool)) as executor:
        future_to_job = {
            executor.submit(extract_skills_from_document_with_token, job.get("description", ""), token_pool[i % len(token_pool)]): job
            for i, job in enumerate(job_descriptions)
        }
        for future in as_completed(future_to_job):
            job = future_to_job[future]
            try:
                response = future.result()
                if response:
                    skills = extract_skill_names(response)
                    all_skills.append((job, skills))
                else:
                    logging.error(f"Failed to extract skills for job: {job.get('positionName')}")
            except Exception as e:
                logging.error(f"Error processing job: {job.get('positionName')} - {e}")
    return all_skills

# Input and output models
class JobMatch(BaseModel):
    positionName: str
    company: str
    matchScore: int
    matchedSkills: List[str]
    missingSkills: List[str]
    url: str
    postedAt: str
    description: str

# Function to get a new access token
def get_access_token():
    payload = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "client_credentials",
        "scope": SCOPE
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    response = requests.post(TOKEN_URL, data=payload, headers=headers)

    if response.ok:
        return response.json().get("access_token", "")
    else:
        logging.error("Failed to generate token")
        return None

@app.post("/upload-jobs/")
async def upload_jobs():
    global jobs_data
    jobs_data = []
    if not os.path.exists(JOBS_DIR):
        raise HTTPException(status_code=404, detail=f"Directory {JOBS_DIR} not found.")
    for file_name in os.listdir(JOBS_DIR):
        file_path = os.path.join(JOBS_DIR, file_name)
        with open(file_path, "r") as file:
            jobs_data.extend(json.load(file))
    return {"message": f"{len(jobs_data)} jobs uploaded from {JOBS_DIR}."}

@app.post("/upload-cv/")
async def upload_cv():
    global cv_data
    cv_file = os.path.join(CV_DIR, "CV.pdf")
    if not os.path.exists(cv_file):
        raise HTTPException(status_code=404, detail=f"File {cv_file} not found.")
    
    # Extract text using pdfminer
    content = extract_text(cv_file)
    
    # Print the extracted text for verification
    print("Extracted Text from CV:")
    print(content)
    
    token = token_pool[0] if token_pool else get_access_token()
    api_response = extract_skills_from_document_with_token(content, token)
    cv_data["skills"] = extract_skill_names(api_response) if api_response else []
    return {"message": "CV uploaded and skills extracted.", "skills": cv_data["skills"]}

@app.get("/match-jobs/")
async def match_jobs():
    if not jobs_data or not cv_data:
        raise HTTPException(status_code=400, detail="Jobs or CV data not uploaded.")

    start_time = time.time()

    # Concurrently extract skills from job descriptions
    job_skills_data = extract_skills_concurrently(jobs_data)

    results = []
    for job, job_skills in job_skills_data:
        matched_skills = set(job_skills) & set(cv_data["skills"])
        missing_skills = set(job_skills) - matched_skills
        match_score = int(jaccard_similarity(set(job_skills), set(cv_data["skills"])) * 100)

        # Determine the correct URL to use
        job_url = job.get("externalApplyLink") or job.get("url")

        results.append(JobMatch(
            positionName=job["positionName"],
            company=job["company"],
            matchScore=match_score,
            matchedSkills=list(matched_skills),
            missingSkills=list(missing_skills),
            url=job_url,
            postedAt=job["postedAt"],
            description=job["description"]
        ))

    results.sort(key=lambda x: x.matchScore, reverse=True)

    end_time = time.time()
    print(f"Total matching time: {end_time - start_time} seconds")

    return results

# Run the app for testing
if __name__ == "__main__":
    populate_tokens(pool_size=2)  # Generate a pool of 5 tokens
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
