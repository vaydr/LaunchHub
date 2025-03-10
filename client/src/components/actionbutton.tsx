import { Button } from "@/components/ui/button";

interface ActionButtonProps {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }
  
  const ActionButton = ({ text, onClick, icon }: ActionButtonProps) => (
    <Button
      size="lg"
      className="bg-white text-purple-900 hover:bg-white/90 flex items-center gap-2"
      onClick={onClick}
    >
      {icon}
      {text}
    </Button>
  );
  
  export default ActionButton;