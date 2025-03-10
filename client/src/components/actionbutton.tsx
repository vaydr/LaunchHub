import { Button } from "@/components/ui/button";

interface ActionButtonProps {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'gradient' | 'outline';
  }
  
  const ActionButton = ({ text, onClick, icon, variant = 'default' }: ActionButtonProps) => {
    if (variant === 'gradient') {
      return (
        <Button
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border border-white flex items-center gap-2 min-w-[160px]"
          onClick={onClick}
        >
          {icon}
          {text}
        </Button>
      );
    }
    
    if (variant === 'outline') {
      return (
        <Button
          size="lg"
          className="bg-white text-purple-900 hover:bg-white/90 border border-purple-600 flex items-center gap-2 min-w-[160px]"
          onClick={onClick}
        >
          {icon}
          {text}
        </Button>
      );
    }
    
    return (
      <Button
        size="lg"
        className="bg-white text-purple-900 hover:bg-white/90 flex items-center gap-2 min-w-[160px]"
        onClick={onClick}
      >
        {icon}
        {text}
      </Button>
    );
  };
  
  export default ActionButton;