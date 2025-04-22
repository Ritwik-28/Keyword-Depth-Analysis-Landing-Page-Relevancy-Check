
import React from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  alt = 'Screenshot' 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
        <DialogClose className="absolute right-2 top-2 rounded-full bg-black/20 p-2 text-white hover:bg-black/40 z-10">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="bg-black/75 p-1 rounded-lg">
          <img 
            src={imageUrl} 
            alt={alt} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onError={(e) => {
              console.error('Error loading image:', imageUrl);
              (e.target as HTMLImageElement).src = '/placeholder.svg';
              (e.target as HTMLImageElement).alt = 'Error loading image';
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
