export function Panel({ 
  type, 
  layout,
  previewLayout,
  onPositionChange, 
  onDragStart,
  onDragEnd,
  onDragOver,
  className,
  style,
  isDragging
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [mouseDown, setMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      e.preventDefault();
      setMouseDown(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
      onDragStart(e);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!mouseDown || !dragStart) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setDragPosition({ x: deltaX, y: deltaY });

      // Determine new position
      const screenX = e.clientX;
      const screenY = e.clientY;
      let newPosition = screenX < window.innerWidth * 0.5 
        ? 'left' 
        : screenY < window.innerHeight * 0.5 ? 'right-top' : 'right-bottom';

      if (newPosition !== targetPosition) {
        setTargetPosition(newPosition);
        onDragOver(newPosition);
      }
    };

    const handleGlobalMouseUp = () => {
      if (targetPosition) {
        onPositionChange(type, targetPosition);
      }
      setMouseDown(false);
      setDragStart(null);
      setDragPosition({ x: 0, y: 0 });
      setTargetPosition(null);
      onDragEnd?.();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [mouseDown, dragStart, targetPosition]);

  // ... rest of component code
} 