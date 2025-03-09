
interface OverlayProps {
    background: string | React.CSSProperties;
    textColor: string;
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
        <div className={`container mx-auto px-4 py-24 text-${textColor}`}>
          <div className="max-w-4xl mx-auto space-y-24">
            {sections.map((section, index) => (
              <section key={index}>
                <h2 className="text-4xl font-bold mb-6">{section.title}</h2>
                <p className={`text-lg ${textColor === 'white' ? 'text-gray-300' : 'text-gray-900'}`}>
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