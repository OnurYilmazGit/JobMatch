import { UploadArea } from '@/components/upload-area'
import { MotionDiv } from '@/components/client-motion'

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-shift" />
      
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <MotionDiv
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
            }}
            animate={{
              x: [Math.random() * 100, Math.random() * -100],
              y: [Math.random() * 100, Math.random() * -100],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="mb-4 text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Your Perfect Job Awaits!
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Upload your CV and let our AI find your dream job.
          </p>
        </MotionDiv>
        
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <UploadArea />
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        >
          {[
            { title: 'Smart Matching', description: 'AI-powered job matching based on your skills and experience' },
            { title: 'Save & Track', description: 'Keep track of interesting opportunities in your personal dashboard' },
            { title: 'Quick Apply', description: 'Apply to multiple positions with just one click' },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-lg bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </MotionDiv>
      </div>
    </main>
  )
}

