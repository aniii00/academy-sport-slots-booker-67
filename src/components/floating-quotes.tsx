
import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const QUOTES = [
  {
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    text: "Hard work beats talent when talent doesn't work hard.",
    author: "Tim Notke"
  },
  {
    text: "Champions keep playing until they get it right.",
    author: "Billie Jean King"
  },
  {
    text: "I hated every minute of training, but I said, 'Don't quit.'",
    author: "Muhammad Ali"
  },
  {
    text: "Winning means you're willing to go longer, work harder.",
    author: "Vince Lombardi"
  }
];

export function FloatingQuotes() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        setIsAnimating(false);
      }, 500); // Half of the transition duration
    }, 7000); // Change quote every 7 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-8 z-50 max-w-sm">
      <div className={cn(
        "relative flex items-start gap-3 p-4 pr-12 rounded-2xl shadow-lg backdrop-blur-xl",
        "bg-white/90 dark:bg-gray-800/90 border border-white/20",
        "transition-all duration-1000 ease-in-out",
        isAnimating && "opacity-0 translate-y-2",
        "hover:shadow-xl"
      )}>
        <Quote className="w-5 h-5 mt-1 flex-shrink-0 text-sports-blue" />
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            {QUOTES[currentQuoteIndex].text}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            — {QUOTES[currentQuoteIndex].author}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Dismiss quote"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
