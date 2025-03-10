import React, { useState, useEffect, useRef } from 'react';
import { Panel, DropdownProvider } from '@/components/Panel';
import { initGoogleApi } from '@/services/googleApi';
import { Sidebar } from '@/components/Sidebar.tsx'
import { InfoLinks } from '@/components/InfoLinks';
import { ServiceInfo } from '@/components/ServiceInfo';

// First define the constants
const PANEL_DIMENSIONS = {
  LEFT: { width: '60%', height: '100%' },
  RIGHT: { width: '40%', height: '50%' }
};

export default function App() {
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [initializationState, setInitializationState] = useState('starting');
  const [isDragging, setIsDragging] = useState(false);
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(0);
  const [layout, setLayout] = useState({
    essay: { position: 'left', ...PANEL_DIMENSIONS.LEFT },
    outline: { position: 'right-top', ...PANEL_DIMENSIONS.RIGHT },
    resources: { position: 'right-bottom', ...PANEL_DIMENSIONS.RIGHT }
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
  const [showInfoLinks, setShowInfoLinks] = useState(false);
  const [showServiceInfo, setShowServiceInfo] = useState(false);

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

  // Simplify getPanelStyles to only handle position
  const getPanelStyles = (position, width) => ({
    position: 'absolute',
    width: position === 'left' ? PANEL_DIMENSIONS.LEFT.width : PANEL_DIMENSIONS.RIGHT.width,
    height: position === 'left' ? PANEL_DIMENSIONS.LEFT.height : PANEL_DIMENSIONS.RIGHT.height,
    ...(position === 'left' 
      ? { left: '0', top: '0' }
      : position === 'right-top'
      ? { right: '0', top: '0' }
      : { right: '0', bottom: '0' }
    ),
    transition: position === 'left' ? 'none' : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
  });

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
        console.log('🎹 Keydown:', e.key, 'Alt:', e.altKey);
        
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          console.log('🔄 Swapping right panels');
          
          // Swap right panels vertically
          setPanelContents(prev => {
            const topContent = prev['right-top'];
            const bottomContent = prev['right-bottom'];
            
            return {
              ...prev,
              'right-top': bottomContent,
              'right-bottom': topContent
            };
          });

          // Update layout while maintaining widths
          setLayout(prev => {
            const topPanel = Object.entries(prev).find(([_, value]) => value.position === 'right-top')?.[0];
            const bottomPanel = Object.entries(prev).find(([_, value]) => value.position === 'right-bottom')?.[0];
            
            if (topPanel && bottomPanel) {
              return {
                ...prev,
                [topPanel]: { ...prev[topPanel], position: 'right-bottom' },
                [bottomPanel]: { ...prev[bottomPanel], position: 'right-top' }
              };
            }
            return prev;
          });
        }
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          
          // Cycle all panels
          setPanelContents(prev => {
            const positions = ['left', 'right-top', 'right-bottom'];
            let assignments = positions.map(pos => prev[pos]);
            
            if (e.key === 'ArrowLeft') {
              const [first, ...rest] = assignments;
              assignments = [...rest, first];
            } else {
              const last = assignments.pop();
              assignments = [last, ...assignments];
            }
            
            return positions.reduce((acc, pos, i) => ({
              ...acc,
              [pos]: assignments[i]
            }), {});
          });

          // Update layout while maintaining widths
          setLayout(prev => {
            const newLayout = { ...prev };
            Object.keys(prev).forEach(key => {
              const currentPos = prev[key].position;
              let newPos;
              
              if (e.key === 'ArrowLeft') {
                newPos = currentPos === 'left' ? 'right-bottom' :
                        currentPos === 'right-top' ? 'left' : 'right-top';
              } else {
                newPos = currentPos === 'left' ? 'right-top' :
                        currentPos === 'right-top' ? 'right-bottom' : 'left';
              }
              
              newLayout[key] = {
                ...prev[key],
                position: newPos,
                width: prev[key].width // Maintain original width
              };
            });
            return newLayout;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      // Maintain original widths when swapping
      newPreviewLayout[swapType] = {
        ...swapLayout,
        position: layout[draggedType].position,
        width: layout[swapType].width, // Keep original width
        isMoving: true
      };
    }
    
    // Update dragged panel position while maintaining its width
    newPreviewLayout[draggedType] = {
      ...layout[draggedType],
      position: position,
      width: layout[draggedType].width, // Keep original width
      isMoving: true,
      transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)`,
      zIndex: 50
    };
    
    setPreviewLayout(newPreviewLayout);
  };

  const handlePanelMove = (draggedType, targetPosition) => {
    const swapType = Object.entries(layout).find(
      ([_, value]) => value.position === targetPosition
    )?.[0];

    if (swapType) {
      setLayout(prev => ({
        ...prev,
        [draggedType]: {
          ...prev[draggedType],
          position: targetPosition,
          width: targetPosition === 'left' ? PANEL_DIMENSIONS.LEFT.width : PANEL_DIMENSIONS.RIGHT.width,
          height: targetPosition === 'left' ? PANEL_DIMENSIONS.LEFT.height : PANEL_DIMENSIONS.RIGHT.height
        },
        [swapType]: {
          ...prev[swapType],
          position: prev[draggedType].position,
          width: prev[draggedType].position === 'left' ? PANEL_DIMENSIONS.LEFT.width : PANEL_DIMENSIONS.RIGHT.width,
          height: prev[draggedType].position === 'left' ? PANEL_DIMENSIONS.LEFT.height : PANEL_DIMENSIONS.RIGHT.height
        }
      }));

      setPanelContents(prev => {
        const newContents = { ...prev };
        Object.keys(prev).forEach(pos => {
          if (prev[pos] === draggedType) {
            newContents[targetPosition] = draggedType;
            newContents[pos] = prev[targetPosition];
          }
        });
        return newContents;
      });
    }
  };

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    setDraggedPanel(type);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
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
    if (isDragging) {
      setIsDragging(false);
      setDraggedPanel(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    }
  };

  const handleDocumentMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedPanel(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    }
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

  useEffect(() => {
    const handleDocumentMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mouseup', handleDocumentMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, []);

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
              {/* Dynamic Drop zone indicators - only show when dragging */}
              {isDragging && (
                <>
                  {Object.entries(layout).map(([panelType, panelLayout]) => {
                    // Skip the panel being dragged
                    if (panelType === draggedPanel) return null;

                    return (
                      <div 
                        key={panelType}
                        className="absolute border-4 rounded-lg z-30 transition-colors duration-200"
                        style={{
                          ...getPanelStyles(panelLayout.position, panelLayout.width),
                          ...(dropTarget === panelLayout.position ? {
                            borderColor: 'hsl(var(--primary))',
                            backgroundColor: 'hsl(var(--primary) / 0.2)',
                            opacity: 1
                          } : {
                            borderColor: 'hsl(var(--primary) / 0.4)',
                            backgroundColor: 'hsl(var(--primary) / 0.05)',
                            opacity: 0.7
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
                const isLeftPanel = position === 'left';
                
                return (
                  <Panel 
                    key={type}
                    type={type}
                    style={{
                      ...getPanelStyles(position, layout[type].width),
                      ...(isDragging && draggedPanel === type ? {
                        transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)`,
                        zIndex: 100,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        transition: 'none',
                        cursor: 'grabbing',
                        pointerEvents: 'none'
                      } : {
                        zIndex: isLeftPanel ? 10 : 20,
                        // Only add transitions for right panels
                        transition: isLeftPanel ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      })
                    }}
                    layout={layout[type]}
                    onPositionChange={handlePanelMove}
                    onDragStart={(e) => handleMouseDown(e, type)}
                    onDragEnd={handleMouseUp}
                    onDragOver={(position) => handleDragOver(position, type)}
                    className={isDragging && draggedPanel === type ? 'will-change-transform' : ''}
                    isDragging={isDragging && draggedPanel === type}
                    setIsDragging={setIsDragging}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <button 
        className="fixed top-4 right-4 bg-blue-500 text-white p-2 rounded-md" 
        onClick={() => setShowInfoLinks(!showInfoLinks)}
      >
        Show Info
      </button>
      {showInfoLinks && (
        <div className="fixed top-16 right-4 z-50">
          <InfoLinks onClose={() => setShowInfoLinks(false)} />
        </div>
      )}
      {showServiceInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
          <div className="relative max-w-md w-full m-4">
            <ServiceInfo />
            <button 
              onClick={() => setShowServiceInfo(false)}
              className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded-full p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </DropdownProvider>
  );
} 