import React, { useState, useEffect } from 'react';
import { Panel, DropdownProvider } from '@/components/Panel';
import { initGoogleApi } from '@/services/googleApi';
import { Sidebar } from '@/components/Sidebar.tsx'

export default function App() {
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [initializationState, setInitializationState] = useState('starting');
  const [isDragging, setIsDragging] = useState(false);
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(0);
  const [layout, setLayout] = useState({
    essay: { position: 'left', width: '60%', height: '100%' },
    outline: { position: 'right-top', width: '40%', height: '48%' },
    resources: { position: 'right-bottom', width: '40%', height: '48%' }
  });
  const [dropTarget, setDropTarget] = useState(null);
  const [previewLayout, setPreviewLayout] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedPanel, setDraggedPanel] = useState(null);
  const [panelContents, setPanelContents] = useState({
    left: 'essay',
    'right-top': 'outline',
    'right-bottom': 'resources'
  });

  // Define preset layouts with exact positioning
  const LAYOUTS = {
    DEFAULT: {
      essay: { position: 'left', width: '60%' },
      outline: { position: 'right-top', width: '40%' },
      resources: { position: 'right-bottom', width: '40%' }
    },
    // RIGHT_MAIN: {
    //   essay: { position: 'right', width: '60%' },
    //   outline: { position: 'left-top', width: '40%' },
    //   resources: { position: 'left-bottom', width: '40%' }
    // },
    // COLUMNS: {
    //   essay: { position: 'left-column', width: '33.333%' },
    //   outline: { position: 'center-column', width: '33.333%' },
    //   resources: { position: 'right-column', width: '33.333%' }
    // }
  };

  // Update Panel component to handle positions
  const getPanelStyles = (position, width) => {
    const styles = {
      position: 'absolute',
      width,
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    };

    switch (position) {
      case 'left':
        return { ...styles, left: '0', top: '0', height: '100%' };
      case 'right':
        return { ...styles, right: '0', top: '0', height: '100%' };
      case 'right-top':
        return { ...styles, right: '0', top: '0', height: '48%' };
      case 'right-bottom':
        return { ...styles, right: '0', bottom: '0', height: '48%' };
      case 'left-top':
        return { ...styles, left: '0', top: '0', height: '48%' };
      case 'left-bottom':
        return { ...styles, left: '0', bottom: '0', height: '48%' };
      case 'left-column':
        return { ...styles, left: '0', top: '0', height: '100%' };
      case 'center-column':
        return { ...styles, left: '33.333%', top: '0', height: '100%' };
      case 'right-column':
        return { ...styles, right: '0', top: '0', height: '100%' };
      default:
        return styles;
    }
  };

  // Update layout order to only use DEFAULT
  const layoutOrder = [LAYOUTS.DEFAULT]; // Removed other layouts

  useEffect(() => {
    console.log('%c App Initialization Started', 'background: #222; color: #bada55');
    
    const initialize = async () => {
      try {
        console.log('Starting full initialization...');
        setInitializationState('initializing-api');
        await initGoogleApi();
        console.log('%c Full Initialization Success', 'background: green; color: white');
        setInitializationState('completed');
        setIsGapiLoaded(true);
      } catch (error) {
        const errorMsg = error.message || 'Unknown error occurred';
        console.error('%c Initialization Failed', 'background: red; color: white', {
          error,
          state: initializationState,
          message: errorMsg,
        });
        setInitializationState('error');
        setError(errorMsg);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        console.log('Alt key pressed:', e.key);
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          
          setPanelContents(prev => {
            const positions = ['left', 'right-top', 'right-bottom'];
            let assignments = positions.map(pos => prev[pos]);
            
            // Rotate assignments
            if (e.key === 'ArrowLeft') {
              const [first, ...rest] = assignments;
              assignments = [...rest, first];
            } else {
              const last = assignments.pop();
              assignments = [last, ...assignments];
            }
            
            // Create new assignments without reloading documents
            const newAssignments = positions.reduce((acc, pos, i) => ({
              ...acc,
              [pos]: assignments[i]
            }), {});

            // Update layout positions without changing document data
            const newLayout = {...layout};
            positions.forEach((pos, i) => {
              const type = assignments[i];
              newLayout[type] = {
                ...newLayout[type],
                position: pos,
                width: pos === 'left' ? '60%' : '40%',
                height: pos === 'left' ? '100%' : '48%'
              };
            });
            setLayout(newLayout);
            
            return newAssignments;
          });
        }
        
        // Add vertical rotation for right panels
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          
          setPanelContents(prev => {
            // Only swap right-top and right-bottom
            const topContent = prev['right-top'];
            const bottomContent = prev['right-bottom'];
            
            // Create new assignments
            return {
              ...prev,
              'right-top': bottomContent,
              'right-bottom': topContent
            };
          });
          
          // Update layout positions
          setLayout(prev => {
            const newLayout = { ...prev };
            const topPanel = Object.entries(newLayout).find(([_, value]) => value.position === 'right-top')[0];
            const bottomPanel = Object.entries(newLayout).find(([_, value]) => value.position === 'right-bottom')[0];
            
            // Swap positions
            newLayout[topPanel] = {
              ...newLayout[topPanel],
              position: 'right-bottom'
            };
            
            newLayout[bottomPanel] = {
              ...newLayout[bottomPanel],
              position: 'right-top'
            };
            
            return newLayout;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layout]);

  const handleDragOver = (position, draggedType) => {
    setDropTarget(position);
    
    // Create preview layout
    const newPreviewLayout = { ...layout };
    
    // Find panel currently in target position
    const panelInTargetPosition = Object.entries(newPreviewLayout).find(
      ([key, value]) => value.position === position
    );
    
    if (panelInTargetPosition) {
      const [swapType, swapLayout] = panelInTargetPosition;
      // Swap positions
      newPreviewLayout[swapType] = {
        ...swapLayout,
        position: layout[draggedType].position,
        width: layout[draggedType].width,
        isMoving: true,
        transform: 'none' // Reset transform for non-dragged panel
      };
    }
    
    // Update dragged panel position with cursor position
    newPreviewLayout[draggedType] = {
      ...layout[draggedType],
      position: position,
      width: position === 'left' ? '60%' : '40%',
      isMoving: true,
      transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)`, // Add cursor position
      zIndex: 50 // Keep dragged panel on top
    };
    
    setPreviewLayout(newPreviewLayout);
  };

  const handlePanelMove = (type, newPosition) => {
    // Find panel currently in target position
    const panelInTargetPosition = Object.entries(layout).find(
      ([key, value]) => value.position === newPosition
    );
    
    // Create new layout
    const newLayout = { ...layout };
    
    if (panelInTargetPosition) {
      const [swapType] = panelInTargetPosition;
      const currentTypePosition = layout[type].position;
      
      // Swap positions while maintaining correct widths
      newLayout[swapType] = {
        ...layout[swapType],
        position: currentTypePosition,
        width: currentTypePosition === 'left' ? '60%' : '40%',
        height: currentTypePosition === 'left' ? '100%' : '48%'
      };
      
      newLayout[type] = {
        ...layout[type],
        position: newPosition,
        width: newPosition === 'left' ? '60%' : '40%',
        height: newPosition === 'left' ? '100%' : '48%'
      };

      // Update panel contents
      setPanelContents(prev => {
        const newContents = { ...prev };
        // Swap the contents
        newContents[currentTypePosition] = swapType;
        newContents[newPosition] = type;
        return newContents;
      });
    }
    
    setLayout(newLayout);
    setPreviewLayout(null);
    setDropTarget(null);
  };

  const handleMouseDown = (e, type) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
    setDraggedPanel(type);
    setDragPosition({ x: 0, y: 0 });
  };

  const handleMouseMove = (e) => {
    if (isDragging && draggedPanel) {
      // Direct cursor position update without animation
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setDragPosition({ x: newX, y: newY });

      // Calculate drop target based on cursor position and current layout
      const screenX = e.clientX;
      const screenY = e.clientY;
      let newDropTarget;

      // Determine drop target based on current layout
      if (currentLayoutIndex === 2) { // COLUMNS layout
        if (screenX < window.innerWidth * 0.33) {
          newDropTarget = 'left-column';
        } else if (screenX < window.innerWidth * 0.66) {
          newDropTarget = 'center-column';
        } else {
          newDropTarget = 'right-column';
        }
      } else { // DEFAULT or RIGHT_MAIN layouts
        newDropTarget = screenX < window.innerWidth * 0.5 
          ? (currentLayoutIndex === 0 ? 'left' : 'left-top')
          : (screenY < window.innerHeight * 0.5 ? 'right-top' : 'right-bottom');
      }

      if (newDropTarget !== dropTarget) {
        setDropTarget(newDropTarget);
        // Update preview layout when drop target changes
        handleDragOver(newDropTarget, draggedPanel);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dropTarget) {
      // Apply the position change before clearing states
      handlePanelMove(draggedPanel, dropTarget);
    }
    setIsDragging(false);
    setDragPosition({ x: 0, y: 0 });
    setDragStart(null);
    setDraggedPanel(null);
    setDropTarget(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">State: {initializationState}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isGapiLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">
          <p>Initializing Google API...</p>
          <p className="text-sm mt-2">State: {initializationState}</p>
        </div>
      </div>
    );
  }

  return (
    <DropdownProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1">
          <div className={`relative min-h-screen bg-background p-8 ${isDragging ? 'select-none cursor-grabbing' : ''}`}>
            <div className="relative h-[calc(100vh-4rem)] gap-8">
              {/* Dynamic Drop zone indicators */}
              {isDragging && (
                <>
                  {Object.entries(layout).map(([panelType, panelLayout]) => {
                    // Skip the panel being dragged
                    if (panelType === draggedPanel) return null;

                    return (
                      <div 
                        key={panelType}
                        className={`absolute border-4 rounded-lg z-30
                          transition-all duration-200 ease-in-out`}
                        style={{
                          ...getPanelStyles(panelLayout.position, panelLayout.width),
                          ...(dropTarget === panelLayout.position ? {
                            borderColor: 'hsl(var(--primary))',
                            backgroundColor: 'hsl(var(--primary) / 0.2)',
                            transform: 'scale(1.02)'
                          } : {
                            borderColor: 'hsl(var(--primary) / 0.4)',
                            backgroundColor: 'hsl(var(--primary) / 0.05)',
                            ':hover': {
                              borderColor: 'hsl(var(--primary) / 0.6)',
                              backgroundColor: 'hsl(var(--primary) / 0.1)',
                              transform: 'scale(1.01)'
                            }
                          })
                        }}
                      />
                    );
                  })}
                </>
              )}

              {/* Panels */}
              {['left', 'right-top', 'right-bottom'].map(position => {
                const type = panelContents[position];
                return (
                  <Panel 
                    key={type}
                    type={type}
                    style={{
                      ...getPanelStyles(position, layout[type].width),
                      ...(isDragging && draggedPanel === type ? {
                        transform: `translate(${dragPosition.x}px, ${dragPosition.y}px) scale(1.05)`,
                        zIndex: 100, // Increased z-index for dragged panel
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        transition: 'none',
                        cursor: 'grabbing',
                        pointerEvents: 'none' // Prevent panel from interfering with drop zones
                      } : {
                        zIndex: 20, // Base z-index for panels
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      })
                    }}
                    layout={layout[type]}
                    onPositionChange={handlePanelMove}
                    onDragStart={(e) => handleMouseDown(e, type)}
                    onDragEnd={handleMouseUp}
                    onDragOver={(position) => handleDragOver(position, type)}
                    className={`absolute ${
                      isDragging && draggedPanel === type
                        ? 'will-change-transform' 
                        : 'transition-all duration-300 ease-in-out'
                    }`}
                    isDragging={isDragging && draggedPanel === type}
                    setIsDragging={setIsDragging}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DropdownProvider>
  );
} 