import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';



const AuthGuard: React.FC = () => {
    const user = useUser();
    const navigate = useNavigate();



    useEffect(() => {
        if (!user || !user.token) {
            navigate('/auth');
        }
    }, [user, navigate]);
    return null;
};

export default AuthGuard;