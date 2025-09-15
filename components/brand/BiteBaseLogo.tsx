import { motion } from 'framer-motion';
import { Brain, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BiteBaseLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: {
    container: 'h-8',
    icon: 'w-6 h-6',
    text: 'text-lg',
    subtext: 'text-xs'
  },
  md: {
    container: 'h-10',
    icon: 'w-8 h-8',
    text: 'text-xl',
    subtext: 'text-sm'
  },
  lg: {
    container: 'h-12',
    icon: 'w-10 h-10',
    text: 'text-2xl',
    subtext: 'text-base'
  },
  xl: {
    container: 'h-16',
    icon: 'w-12 h-12',
    text: 'text-3xl',
    subtext: 'text-lg'
  }
};

export function BiteBaseLogo({
  size = 'md',
  variant = 'full',
  animated = true,
  className,
  onClick
}: BiteBaseLogoProps) {
  const sizes = sizeClasses[size];

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const iconVariants = {
    idle: { rotate: 0 },
    hover: {
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  const sparkVariants = {
    idle: { scale: 1, opacity: 0.7 },
    hover: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 0.8, repeat: Infinity }
    }
  };

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <motion.div
        variants={animated ? logoVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        whileHover={animated ? "hover" : undefined}
        className={cn(
          "relative flex items-center justify-center cursor-pointer group",
          sizes.container,
          className
        )}
        onClick={onClick}
      >
        <motion.div
          className="relative"
          variants={animated ? iconVariants : undefined}
        >
          {/* Main brain icon with gradient */}
          <div className={cn(
            "relative rounded-xl bg-gradient-to-br from-primary via-blue-600 to-purple-600 p-2 shadow-lg group-hover:shadow-xl transition-shadow",
            sizes.icon
          )}>
            <Brain className="w-full h-full text-white" />
            
            {/* Animated spark effects */}
            {animated && (
              <>
                <motion.div
                  variants={sparkVariants}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
                />
                <motion.div
                  variants={sparkVariants}
                  className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full"
                  style={{ animationDelay: '0.3s' }}
                />
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Text-only variant
  if (variant === 'text') {
    return (
      <motion.div
        variants={animated ? logoVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        className={cn(
          "flex flex-col cursor-pointer group",
          className
        )}
        onClick={onClick}
      >
        <motion.h1
          className={cn(
            "font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-primary transition-all duration-300",
            sizes.text
          )}
          whileHover={animated ? { scale: 1.05 } : undefined}
        >
          BiteBase Intelligence
        </motion.h1>
        <motion.p
          className={cn(
            "text-muted-foreground font-medium -mt-1",
            sizes.subtext
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          AI Market Research
        </motion.p>
      </motion.div>
    );
  }

  // Full variant (default)
  return (
    <motion.div
      variants={animated ? logoVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
      whileHover={animated ? "hover" : undefined}
      className={cn(
        "flex items-center space-x-3 cursor-pointer group",
        sizes.container,
        className
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <motion.div
        className="relative"
        variants={animated ? iconVariants : undefined}
      >
        <div className={cn(
          "relative rounded-xl bg-gradient-to-br from-primary via-blue-600 to-purple-600 p-2 shadow-lg group-hover:shadow-xl transition-shadow",
          sizes.icon
        )}>
          <Brain className="w-full h-full text-white" />
          
          {/* Intelligence indicators */}
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
            animate={animated ? {
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            } : undefined}
            transition={animated ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : undefined}
          >
            <Zap className="w-1.5 h-1.5 text-white" />
          </motion.div>
          
          <motion.div
            className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center"
            animate={animated ? {
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            } : undefined}
            transition={animated ? {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            } : undefined}
          >
            <Target className="w-1 h-1 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Text */}
      <div className="flex flex-col">
        <motion.h1
          className={cn(
            "font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-primary transition-all duration-300",
            sizes.text
          )}
          whileHover={animated ? { scale: 1.02 } : undefined}
        >
          BiteBase Intelligence
        </motion.h1>
        <motion.p
          className={cn(
            "text-muted-foreground font-medium -mt-1 group-hover:text-foreground transition-colors",
            sizes.subtext
          )}
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={animated ? { delay: 0.3 } : undefined}
        >
          AI Market Research
        </motion.p>
      </div>
    </motion.div>
  );
}

// Simplified logo for loading states
export function BiteBaseLogoSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = sizeClasses[size];
  
  return (
    <div className={cn("flex items-center space-x-3 animate-pulse", sizes.container)}>
      <div className={cn("rounded-xl bg-muted", sizes.icon)} />
      <div className="flex flex-col space-y-1">
        <div className={cn("h-4 bg-muted rounded", sizes.text === 'text-lg' ? 'w-24' : sizes.text === 'text-xl' ? 'w-32' : sizes.text === 'text-2xl' ? 'w-40' : 'w-48')} />
        <div className={cn("h-3 bg-muted rounded", sizes.subtext === 'text-xs' ? 'w-16' : sizes.subtext === 'text-sm' ? 'w-20' : 'w-24')} />
      </div>
    </div>
  );
}

// Logo with custom styling for different contexts
export function BiteBaseLogoHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-center mb-8"
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <BiteBaseLogo size="xl" animated className="relative z-10" />
      </div>
    </motion.div>
  );
}

export default BiteBaseLogo;
