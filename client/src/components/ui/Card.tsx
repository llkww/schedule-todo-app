import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export function Card({ className, title, description, actions, children, ...props }: CardProps) {
  return (
    <section className={cn("card", className)} {...props}>
      {title || description || actions ? (
        <div className="card__header">
          <div>
            {title ? <h2 className="card__title">{title}</h2> : null}
            {description ? <p className="card__description">{description}</p> : null}
          </div>
          {actions ? <div className="card__actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
