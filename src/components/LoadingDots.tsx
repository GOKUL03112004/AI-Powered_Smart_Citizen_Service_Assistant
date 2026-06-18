

interface LoadingDotsProps {
  className?: string;
}

export default function LoadingDots({ className = '' }: LoadingDotsProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="loading-dot w-2 h-2 rounded-full bg-primary-500 block"
        />
      ))}
    </div>
  );
}
