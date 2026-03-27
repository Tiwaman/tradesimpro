'use client';

import {
  Panel,
  Group,
  Separator,
} from 'react-resizable-panels';
import type { ComponentProps } from 'react';

type GroupProps = ComponentProps<typeof Group>;
type PanelProps = ComponentProps<typeof Panel>;
type SeparatorProps = ComponentProps<typeof Separator>;

function ResizablePanelGroup({ direction, ...props }: GroupProps & { direction?: 'horizontal' | 'vertical' }) {
  return <Group orientation={direction} {...props} />;
}

function ResizablePanel(props: PanelProps) {
  return <Panel {...props} />;
}

function ResizableHandle({
  className,
  ...props
}: SeparatorProps & { className?: string }) {
  return (
    <Separator
      className={`relative flex items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 ${className || ''}`}
      {...props}
    />
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
