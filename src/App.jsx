import React, { useState, useEffect } from 'react';
import { Panel, DropdownProvider } from '@/components/Panel';
import { initGoogleApi } from '@/services/googleApi';

export default function App() {
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [initializationState, setInitializationState] = useState('starting');
  const [isDragging, setIsDragging] = useState(false);
  const [layout, setLayout] = useState({
    essay: { position: 'left', width: '60%' },
    outline: { position: 'right-top', width: '40%' },
    resources: { position: 'right-bottom', width: '40%' }
  });
  const [dropTarget, setDropTarget] = useState(null);
  const [previewLayout, setPreviewLayout] = useState(null);

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
        width: layout[draggedType].position === 'left' ? '60%' : '40%',
        isMoving: true
      };
    }
    
    // Update dragged panel position
    newPreviewLayout[draggedType] = {
      ...layout[draggedType],
      position: position,
      width: position === 'left' ? '60%' : '40%',
      isMoving: true
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
      // Swap positions
      newLayout[swapType] = {
        ...layout[swapType],
        position: layout[type].position,
        width: layout[type].position === 'left' ? '60%' : '40%'
      };
    }
    
    // Update dragged panel position
    newLayout[type] = {
      ...layout[type],
      position: newPosition,
      width: newPosition === 'left' ? '60%' : '40%'
    };
    
    setLayout(newLayout);
    setPreviewLayout(null);
    setDropTarget(null);
  };

  const handlePanelDragStart = () => {
    setIsDragging(true);
  };

  const handlePanelDragEnd = () => {
    setIsDragging(false);
    setDropTarget(null);
    setPreviewLayout(null);
  };

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
      <div className={`relative min-h-screen bg-background p-8 ${isDragging ? 'select-none' : ''}`}>
        <div className="relative h-[calc(100vh-4rem)] gap-8">
          {/* Drop zone indicators */}
          {isDragging && (
            <>
              <div 
                className={`absolute left-0 top-0 w-[60%] h-full border-4 rounded-lg 
                  transition-all duration-500 origin-center
                  ${dropTarget === 'left' 
                    ? 'opacity-50 border-primary bg-primary/10 scale-100' 
                    : 'opacity-0 border-transparent scale-95'}`}
              />
              <div 
                className={`absolute right-0 top-0 w-[40%] h-[48%] border-4 rounded-lg 
                  transition-all duration-500 origin-center
                  ${dropTarget === 'right-top' 
                    ? 'opacity-50 border-primary bg-primary/10 scale-100' 
                    : 'opacity-0 border-transparent scale-95'}`}
              />
              <div 
                className={`absolute right-0 bottom-0 w-[40%] h-[48%] border-4 rounded-lg 
                  transition-all duration-500 origin-center
                  ${dropTarget === 'right-bottom' 
                    ? 'opacity-50 border-primary bg-primary/10 scale-100' 
                    : 'opacity-0 border-transparent scale-95'}`}
              />
            </>
          )}

          {/* Panels */}
          {['essay', 'outline', 'resources'].map(type => (
            <Panel 
              key={type}
              type={type}
              layout={layout[type]}
              previewLayout={previewLayout?.[type]}
              onPositionChange={handlePanelMove}
              onDragStart={handlePanelDragStart}
              onDragEnd={handlePanelDragEnd}
              onDragOver={(position) => handleDragOver(position, type)}
              className={`absolute transition-all duration-500 ease-in-out will-change-transform ${
                previewLayout?.[type]?.isMoving ? '' : 'transition-none'
              }`}
            />
          ))}
        </div>
      </div>
    </DropdownProvider>
  );
} 