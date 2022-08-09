import './header.css';
declare const Header: ({ user, onLogin, onLogout, onCreateAccount }: {
    user: any;
    onLogin: any;
    onLogout: any;
    onCreateAccount: any;
}) => JSX.Element;
export default Header;
