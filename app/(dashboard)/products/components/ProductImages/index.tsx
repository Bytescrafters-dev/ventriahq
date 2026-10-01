"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import ImageCard from "./imageCard";
import ImageUploadModal from "./imageUploadModal";
import {
  useProductImages,
  useUploadProductImage,
  useDeleteProductImage,
  useUpdateImageMetadata,
  useReorderProductImages,
} from "@/hooks/useProductImages";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteDialog from "@/components/delete-confirmation-dialog";
import { ProductImage } from "@/types/productImage";

interface ProductImagesProps {
  productId?: string;
}

const ProductImages = ({ productId }: ProductImagesProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<ProductImage[]>([]);

  const { data: images = [], isLoading } = useProductImages(productId || "");
  const uploadMutation = useUploadProductImage();
  const deleteMutation = useDeleteProductImage();
  const updateMutation = useUpdateImageMetadata();
  const reorderMutation = useReorderProductImages();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const displayImages = localImages.length > 0 ? localImages : images;

  const handleUpload = (file: File, alt: string) => {
    if (!productId) {
      toast.error("Product ID is required");
      return;
    }

    uploadMutation.mutate(
      {
        productId,
        file,
        alt,
        sortOrder: displayImages.length,
      },
      {
        onSuccess: () => {
          toast.success("Image uploaded successfully");
          setModalOpen(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteImageId || !productId) return;

    deleteMutation.mutate(
      { productId, imageId: deleteImageId },
      {
        onSuccess: () => {
          toast.success("Image deleted successfully");
          setDeleteImageId(null);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleSetPrimary = (imageId: string) => {
    if (!productId) return;

    updateMutation.mutate(
      { productId, imageId, data: { isPrimary: true } },
      {
        onSuccess: () => {
          toast.success("Primary image updated");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !productId) return;

    const oldIndex = displayImages.findIndex((img) => img.id === active.id);
    const newIndex = displayImages.findIndex((img) => img.id === over.id);

    const reorderedImages = arrayMove(displayImages, oldIndex, newIndex);
    setLocalImages(reorderedImages);

    const reorderData = reorderedImages.map((img, index) => ({
      id: img.id,
      sortOrder: index,
    }));

    reorderMutation.mutate(
      { productId, images: reorderData },
      {
        onSuccess: () => {
          toast.success("Images reordered");
          setLocalImages([]);
        },
        onError: (error) => {
          toast.error(error.message);
          setLocalImages([]);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Product Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Product Images</h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={displayImages.map((img) => img.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setModalOpen(true)}
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors flex items-center justify-center group"
            >
              <div className="text-center">
                <IconPlus className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-foreground transition-colors" />
                <p className="text-sm text-muted-foreground mt-2">Add Image</p>
              </div>
            </button>

            {displayImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onDelete={(id) => setDeleteImageId(id)}
                onSetPrimary={handleSetPrimary}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ImageUploadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpload={handleUpload}
        isUploading={uploadMutation.isPending}
      />

      <DeleteDialog
        isOpen={!!deleteImageId}
        isLoading={deleteMutation.isPending}
        onOpenChange={() => setDeleteImageId(null)}
        onConfirm={handleDelete}
        title={"Delete Image"}
        description={
          "Are you sure you want to delete this image? This action cannot be undone."
        }
      />
    </div>
  );
};

export default ProductImages;
