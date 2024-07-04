import styled from 'styled-components';
import { Theme } from '../../common/styles/Theme';
import media from '../../common/styles/MediaScreens';

export const HomeContainer = styled.main`
    width: 100%;
    overflow-x: hidden;
`;

export const PhoneImage = styled.img`
    width: 36rem;

     ${media.tablet} { 
        width: 22rem;
    }

    ${media.mobile} { 
        width: 20rem;
    }
`;

export const Subtitle = styled.h2`
    font-size: 1.2rem;
    color: ${Theme.secondaryColor};
    font-weight: 300; 
    width: '32rem';


    ${media.mobile} { 
        font-size: 1.1rem;
        margin-bottom: 2rem;
        margin-top: 0rem;
    }
`;

export const Title = styled.h1`
    font-size: 3.6rem;
    font-weight: 700;
    color: ${Theme.primaryColor};

     ${media.tablet} { 
        margin-top: 4rem;
        font-size: 2.4rem;
    }

    ${media.mobile} {
      margin-bottom: 1rem;
      font-size: 1.8rem;
    }
`;
