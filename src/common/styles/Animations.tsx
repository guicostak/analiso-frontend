    import { keyframes } from 'styled-components';

    export const emergeAnimation = keyframes`
    from {
        transform: translate(-0%, -50%); 
        opacity: 0;
    }
    to {
        transform: translate(-50%, -50%); 
        opacity: 1;
    }
    `;

    export const disappearAnimation = keyframes`
    from {
        transform: translate(-50%, -50%);
        opacity: 1;
    }
    to {
        transform: translate(-0%, -50%); 
        opacity: 0;
    }
    `;
