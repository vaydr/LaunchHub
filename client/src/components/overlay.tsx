interface OverlayProps {
    background: string | React.CSSProperties;
    textColor: string | React.CSSProperties;
    sections: {
      title: string;
      content: string;
    }[];
    reference: React.RefObject<HTMLDivElement>;
  }
  
  function Overlay({ background, textColor, sections, reference }: OverlayProps) {
    const backgroundStyle = typeof background === 'string' 
      ? { background } 
      : background;
    
    const textColorStyle = typeof textColor === 'string'
      ? { color: textColor }
      : textColor;
    
    // Determine paragraph text color based on textColor
    const getParagraphStyle = () => {
      if (typeof textColor === 'string') {
        // For simple string colors, use Tailwind classes
        return { color: textColor === 'white' ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)' };
      } else if (textColor.WebkitTextFillColor === 'transparent') {
        // For gradient text, use a slightly lighter color for paragraphs
        return { ...textColorStyle, opacity: 0.9 };
      } else {
        // Default case
        return textColorStyle;
      }
    };
  
    return (
      <div
        ref={reference}
        className="fixed inset-0"
        style={{
          transform: "translateY(100vh)",
          transition: "transform 0.1s linear",
          zIndex: 10,
          ...backgroundStyle,
        }}
      >
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-24">
            {sections.map((section, index) => (
              <section key={index}>
                <h2 className="text-4xl font-bold mb-6" style={textColorStyle}>
                  {section.title}
                </h2>
                <p className="text-lg" style={getParagraphStyle()}>
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  export default Overlay;