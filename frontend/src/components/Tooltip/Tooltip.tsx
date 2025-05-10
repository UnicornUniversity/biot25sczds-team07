import { memo, ReactNode, useCallback } from "react";
import { Tooltip, OverlayTrigger, TooltipProps } from "react-bootstrap";

interface Props {
    children: ReactNode[] | ReactNode,
    tooltipText: string,
    placement?: "top" | "bottom" | "left" | "right",
}
const ToolTip = (props: Props) => {
    const { children = null, tooltipText, placement = "top" } = props;

    const renderTooltip = useCallback((props: TooltipProps) => (
        <Tooltip id="button-tooltip" {...props}>
            {tooltipText}
        </Tooltip>
    ), [tooltipText]);

    return (
        <OverlayTrigger
            placement={placement}
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
        >
            <div>
                {children}
            </div>
        </OverlayTrigger>
    );
}

export default memo(ToolTip);