import './button.css';
/**
 * Primary UI component for user interaction
 */
declare const Button: ({ primary, backgroundColor, size, label, ...props }: {
    [x: string]: any;
    primary: any;
    backgroundColor: any;
    size: any;
    label: any;
}) => JSX.Element;
export default Button;
