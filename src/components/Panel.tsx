interface PanelProps {
  type: string;
  layout: any;
  onPositionChange: (type: string, position: string) => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDragEnd: () => void;
  onDragOver: (position: string) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

export function Panel({ 
  type,
  layout,
  onPositionChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  isDragging,
  setIsDragging
}: PanelProps) {
  // Rest of the component stays the same...
} 