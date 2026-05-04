import { type CSSProperties, type ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  hero?: boolean;
  style?: CSSProperties;
};

export function Card({ children, hero = false, style }: CardProps) {
  return (
    <div className={hero ? "sw-card-hero" : "sw-card"} style={style}>
      {children}
    </div>
  );
}
