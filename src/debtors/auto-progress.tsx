import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

export default function AutoProgress({ interval }: { interval: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 99) {
          clearInterval(timer);
          return 99;
        }
        return prevProgress + 1;
      });
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <Progress value={progress} className="h-2 px-32" />;
}
