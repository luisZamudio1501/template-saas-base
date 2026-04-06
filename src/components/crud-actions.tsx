import { Button } from "@/components/ui/button";

type CrudActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
};

export function CrudActions({
  onEdit,
  onDelete,
  editLabel = "Editar",
  deleteLabel = "Eliminar",
}: CrudActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {onEdit && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          {editLabel}
        </Button>
      )}
      {onDelete && (
        <Button variant="destructive" size="sm" onClick={onDelete}>
          {deleteLabel}
        </Button>
      )}
    </div>
  );
}
