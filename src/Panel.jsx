// Add memo to prevent unnecessary re-renders
const MemoizedIframe = React.memo(({ src, title, className }) => (
  <iframe 
    src={src}
    title={title}
    className={className}
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation allow-top-navigation allow-modals"
    allowFullScreen={true}
  />
));

// Add useMemo for expensive calculations
const positionStyles = useMemo(() => getPositionStyles(), [layout, isDragging, dragPosition]);

// Add useCallback for event handlers
const handleMouseDown = useCallback((e) => {
  if (e.target.closest('.drag-handle')) {
    e.preventDefault();
    setMouseDown(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    onDragStart(e, type);
  }
}, [onDragStart, type]);

// In the Panel component
const [iframeLoaded, setIframeLoaded] = useState(false);

// Add this function to handle iframe load
const handleIframeLoad = () => {
  setIframeLoaded(true);
};

// In the render:
<div className="relative w-full h-full overflow-hidden rounded-lg">
  <div 
    style={{
      transform: `scale(${zoom}) translate(${panPosition.x / zoom}px, ${panPosition.y / zoom}px)`,
      transformOrigin: 'center',
      transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      opacity: iframeLoaded ? 1 : 0, // Add opacity transition
      transition: 'opacity 0.2s ease-out' // Smooth opacity transition
    }}
  >
    <iframe 
      src={isEditMode ? documentData.editLink : documentData.thumbnailLink}
      title={documentData.name}
      className={`w-full h-full border-0 bg-accent/[0.03] rounded-lg ${isDragging ? 'pointer-events-none' : ''}`}
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation allow-top-navigation allow-modals"
      allowFullScreen={true}
      onLoad={handleIframeLoad} // Add load handler
      style={{
        visibility: iframeLoaded ? 'visible' : 'hidden' // Hide until loaded
      }}
    />
  </div>
</div> 