import { Button } from "@/components/ui/button";

type CrudPageHeaderProps = {
  title: string;
  onCreate?: () => void;
  createLabel?: string;
};

export function CrudPageHeader({
  title,
  onCreate,
  createLabel = "Crear",
}: CrudPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>

      {onCreate && (
        <Button variant="default" size="sm" onClick={onCreate}>
          {createLabel}
        </Button>
      )}
    </div>
  );
}
