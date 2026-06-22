import { cn } from "@/lib/utils";

type PageTitleProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  headingClasses?: string;
  descriptionClasses?: string;
};

export const PageTitle = ({ title, description, children, headingClasses, descriptionClasses }: PageTitleProps) => {
  return (
    <>
      <h1 className={cn("font-semibold text-2xl flex items-center gap-4 mb-2", headingClasses)}>
        {title}
        {children}
      </h1>
      {description ? <p className={cn("text-sm text-muted-foreground mb-4", descriptionClasses)}>
        {description}
      </p> : null}
    </>
  )
};
