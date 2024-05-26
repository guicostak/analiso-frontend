import React from 'react';
import styled from 'styled-components';
import { useNavigate } from '../common/util/routerUtils';
import { Theme } from '../common/styles/Theme';
import { Button } from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faUser } from '../common/util/iconUtils';
import media from '../common/styles/MediaScreens';

const NavButtonsStyled = styled.div`
    display: flex;
    gap: 1rem;

    ${media.mobile} {
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
`; 

export const NavButtons: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <NavButtonsStyled className='nav-buttons'>
      <Button
        $border={`1px solid ${Theme.secondaryColor}`}
        onClick={() => navigate("/dashboard")}
        $textcolor={Theme.secondaryColor}
        $background={Theme.primaryColor}
        width='14rem'
      >
        <FontAwesomeIcon icon={faRightToBracket} style={{ marginRight: '0.5rem' }} /> Acesse o dashboard
      </Button>
      <Button
        $border={`1px solid ${Theme.secondaryColor}`}
        onClick={() => navigate("/register")}
        width='14rem'
      >
        <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem' }} /> Cadastre-se
      </Button>
    </NavButtonsStyled>
  );
};
