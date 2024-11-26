import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { handleAuth, getAvailableAccounts, openFilePicker } from '@/services/googleApi';
import { GripVertical, Pencil, Eye, ZoomIn, ZoomOut, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

// Create context for managing dropdowns
const DropdownContext = createContext();

// Create provider component
export function DropdownProvider({ children }) {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  return (
    <DropdownContext.Provider value={{ openDropdownId, setOpenDropdownId }}>
      {children}
    </DropdownContext.Provider>
  );
}

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
  const [dragStart, setDragStart] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState(null);
  const panelRef = useRef(null);
  const { openDropdownId, setOpenDropdownId } = useContext(DropdownContext);
  const dropdownRef = useRef(null);
  const [accounts, setAccounts] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [showPanControls, setShowPanControls] = useState(false);

  useEffect(() => {
    const availableAccounts = getAvailableAccounts();
    console.log('Available accounts:', availableAccounts);
    setAccounts(availableAccounts);
  }, [openDropdownId]);

  useEffect(() => {
    if (previewLayout && !isDragging) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [previewLayout?.position, isDragging]);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setOpenDropdownId]);

  // Update showAccountDropdown based on context
  const showAccountDropdown = openDropdownId === type;

  // Update dropdown toggle
  const toggleDropdown = () => {
    setOpenDropdownId(openDropdownId === type ? null : type);
  };

  const getPositionStyles = () => {
    const activeLayout = (previewLayout && !isDragging) ? previewLayout : layout;
    
    const baseStyles = {
      width: activeLayout.width,
      height: activeLayout.position.includes('top') || activeLayout.position.includes('bottom') ? '48%' : '100%',
      opacity: isDragging ? '0.95' : '1',
      zIndex: isDragging ? 50 : (activeLayout.zIndex || 0),
      transformOrigin: 'center center',
    };

    if (isDragging) {
      baseStyles.transition = 'none';
    } else if (isTransitioning) {
      baseStyles.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      baseStyles.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)';
    }

    const positionStyles = {
      left: {
        left: '0',
        top: '0',
        transform: isDragging 
          ? `translate(${dragPosition.x}px, ${dragPosition.y}px) scale(${targetPosition === 'left' ? 1 : 0.95})` 
          : 'translate(0, 0) scale(1)'
      },
      'right-top': {
        right: '0',
        top: '0',
        transform: isDragging 
          ? `translate(${dragPosition.x}px, ${dragPosition.y}px) scale(${targetPosition === 'left' ? 1.05 : 1})` 
          : 'translate(0, 0) scale(1)'
      },
      'right-bottom': {
        right: '0',
        bottom: '0',
        transform: isDragging 
          ? `translate(${dragPosition.x}px, ${dragPosition.y}px) scale(${targetPosition === 'left' ? 1.05 : 1})` 
          : 'translate(0, 0) scale(1)'
      }
    };

    return {
      ...baseStyles,
      ...positionStyles[activeLayout.position]
    };
  };

  const handleMouseDown = (e) => {
    // Only start if clicking the handle
    if (e.target.closest('.drag-handle')) {
      e.preventDefault();
      setMouseDown(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
      onDragStart(e, type);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!mouseDown || !dragStart) return;

      if (!isDragging) {
        setIsDragging(true);
        onDragStart?.();
      }

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
      if (isDragging && targetPosition) {
        onPositionChange(type, targetPosition);
      }
      setIsDragging(false);
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
  }, [mouseDown, dragStart, isDragging, targetPosition]);

  const handleAccountSelect = async (accountEmail) => {
    setOpenDropdownId(null); // Close dropdown
    try {
      if (accountEmail === 'new') {
        console.log('Adding new account...');
        const newAccount = await handleAuth(true);
        console.log('New account added:', newAccount);
        setAccounts(getAvailableAccounts());
        const docData = await openFilePicker(type, newAccount.email);
        if (docData) setDocumentData(docData);
      } else {
        console.log('Using existing account:', accountEmail);
        const docData = await openFilePicker(type, accountEmail);
        if (docData) setDocumentData(docData);
      }
    } catch (error) {
      console.error('Error handling account selection:', error);
    }
  };

  const handleClick = async (e) => {
    console.log('CLICK HANDLER TRIGGERED');
    e.preventDefault();
    
    if (!isDragging) {
      try {
        const docData = await openFilePicker(type);
        if (docData) {
          console.log('Setting document data:', docData);
          setDocumentData(docData);
        }
      } catch (error) {
        console.error('Error in click handler:', error);
      }
    }
  };

  const handleDocumentClick = (e) => {
    e.stopPropagation();
    if (documentData?.url && !isDragging) {
      window.open(documentData.url, '_blank');
    }
  };

  const handleUnlink = (e) => {
    e.stopPropagation();
    setDocumentData(null);
  };

  // Update dropdown position calculation
  const updateDropdownPosition = () => {
    if (dropdownRef.current) {
      const buttonRect = dropdownRef.current.getBoundingClientRect();
      const dropdownHeight = 300; // Approximate max height of dropdown
      const dropdownWidth = 256; // w-64 = 16rem = 256px
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const padding = 16;

      // Calculate initial position
      let top = buttonRect.bottom + 8;
      let left = buttonRect.left;

      // Adjust for right panels
      if (layout.position.includes('right')) {
        // Align dropdown to the right edge of the button
        left = Math.min(
          buttonRect.right - dropdownWidth,
          windowWidth - dropdownWidth - padding
        );
      }

      // Ensure dropdown doesn't go off bottom of screen
      if (top + dropdownHeight > windowHeight - padding) {
        // Position above the button if there's not enough space below
        top = Math.max(padding, buttonRect.top - dropdownHeight - 8);
      }

      // Ensure dropdown doesn't go off left side
      left = Math.max(padding, left);

      // Create portal container if it doesn't exist
      let portalContainer = document.getElementById('dropdown-portal');
      if (!portalContainer) {
        portalContainer = document.createElement('div');
        portalContainer.id = 'dropdown-portal';
        document.body.appendChild(portalContainer);
      }

      setDropdownPosition({ top, left });
    }
  };

  // Update useEffect to handle window resize
  useEffect(() => {
    if (showAccountDropdown) {
      updateDropdownPosition();
      const handleResize = () => {
        updateDropdownPosition();
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showAccountDropdown, layout.position]);

  const toggleEditMode = (e) => {
    e.stopPropagation();
    setIsEditMode(!isEditMode);
  };

  // Add zoom handlers
  const handleZoomIn = (e) => {
    e.stopPropagation();
    const newZoom = Math.min(zoom + 0.25, 3);
    setZoom(newZoom);
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    const newZoom = Math.max(zoom - 0.25, 0.5);
    setZoom(newZoom);
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setZoom(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Add pan handlers
  const handlePan = (direction, e) => {
    e.stopPropagation();
    const panAmount = 100;
    
    switch(direction) {
      case 'up':
        setPanPosition(prev => ({ ...prev, y: prev.y + panAmount }));
        break;
      case 'down':
        setPanPosition(prev => ({ ...prev, y: prev.y - panAmount }));
        break;
      case 'left':
        setPanPosition(prev => ({ ...prev, x: prev.x + panAmount }));
        break;
      case 'right':
        setPanPosition(prev => ({ ...prev, x: prev.x - panAmount }));
        break;
    }
  };

  // Show/hide pan controls based on zoom level
  useEffect(() => {
    setShowPanControls(zoom > 1);
    if (zoom === 1) {
      setPanPosition({ x: 0, y: 0 });
    }
  }, [zoom]);

  // In the Panel component, add a check to prevent reloading
  const handlePositionChange = (newPosition) => {
    if (documentData) {
      // If we already have document data, just update position
      onPositionChange(type, newPosition);
    } else {
      // Only reload document if we don't have one
      handleDocumentLoad();
    }
  };

  return (
    <div
      ref={panelRef}
      style={style || getPositionStyles()}
      className={`absolute ${className}`}
    >
      <Card className={`w-full h-full relative ${isDragging ? 'border-4 border-primary shadow-lg scale-105' : 'border-2 border-dashed border-muted-foreground'}`}>
        <div 
          className={`drag-handle absolute top-2 left-2 p-2 rounded-full bg-background/80 
            text-muted-foreground z-50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="w-full h-full">
          {documentData ? (
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
                  left: 0
                }}
              >
                <iframe 
                  src={isEditMode ? documentData.editLink : documentData.thumbnailLink}
                  title={documentData.name}
                  className={`w-full h-full border-0 bg-accent/[0.03] rounded-lg ${isDragging ? 'pointer-events-none' : ''}`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation allow-top-navigation allow-modals"
                  allowFullScreen={true}
                />
              </div>

              {/* Add zoom controls */}
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <div className="flex items-center gap-1 bg-background/80 rounded-full px-2">
                  <button onClick={handleZoomOut} className="p-2 rounded-full hover:bg-background/95">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-muted-foreground w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button onClick={handleZoomIn} className="p-2 rounded-full hover:bg-background/95">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={handleResetZoom} className="p-2 rounded-full hover:bg-background/95">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={toggleEditMode}
                  className="p-2 rounded-full bg-background/80 hover:bg-background/95 
                    transition-colors duration-200 text-muted-foreground 
                    hover:text-foreground"
                  title={isEditMode ? "View mode" : "Edit mode"}
                >
                  {isEditMode ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => window.open(documentData.editLink, '_blank')}
                  className="p-2 rounded-full bg-background/80 hover:bg-background/95 
                    transition-colors duration-200 text-muted-foreground 
                    hover:text-foreground"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  className="p-2 rounded-full bg-background/80 hover:bg-background/95 
                    transition-colors duration-200 text-muted-foreground 
                    hover:text-foreground"
                  title="Unlink document"
                  onClick={handleUnlink}
                >
                  ×
                </button>
              </div>

              {/* Add pan controls */}
              {showPanControls && (
                <>
                  {/* Center vertical controls */}
                  <div className="absolute left-1/2 top-2 -translate-x-1/2 z-20">
                    <button
                      onClick={(e) => handlePan('up', e)}
                      className="p-2 rounded-full bg-background/80 hover:bg-background/95 
                        transition-colors duration-200 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute left-1/2 bottom-2 -translate-x-1/2 z-20">
                    <button
                      onClick={(e) => handlePan('down', e)}
                      className="p-2 rounded-full bg-background/80 hover:bg-background/95 
                        transition-colors duration-200 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Center horizontal controls */}
                  <div className="absolute top-1/2 left-2 -translate-y-1/2 z-20">
                    <button
                      onClick={(e) => handlePan('left', e)}
                      className="p-2 rounded-full bg-background/80 hover:bg-background/95 
                        transition-colors duration-200 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 z-20">
                    <button
                      onClick={(e) => handlePan('right', e)}
                      className="p-2 rounded-full bg-background/80 hover:bg-background/95 
                        transition-colors duration-200 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <DropdownMenu open={showAccountDropdown} onOpenChange={toggleDropdown}>
                <DropdownMenuTrigger asChild>
                  <button 
                    type="button"
                    className="text-center w-40 h-40 rounded-lg 
                      bg-accent/[0.03] hover:bg-accent/[0.07] transition-colors duration-300
                      flex items-center justify-center select-none cursor-pointer"
                  >
                    <div>
                      <span className="text-4xl mb-2 block">+</span>
                      <p>Link Document</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  {accounts.map(account => (
                    <DropdownMenuItem
                      key={account.email}
                      onClick={() => handleAccountSelect(account.email)}
                      className="flex items-center gap-3 p-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent/[0.07] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <div className="w-full h-full flex items-center justify-center text-foreground font-medium">
                          {account.name?.charAt(0) || account.email?.charAt(0)}
                        </div>
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{account.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{account.email}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {accounts.length > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => handleAccountSelect('new')}
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/[0.07] flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">+</span>
                    </div>
                    <p className="text-left">Add new account</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 