import React from 'react';
import styled from 'styled-components';
import { Link } from '../common/util/imports/routerUtilsImports';
import media from '../common/styles/MediaScreens';
import { Theme } from '../common/styles/Theme';

const NavOptionsStyled = styled.div`
ul {
    list-style: none;
    display: flex;
    flex-direction: row;
    gap: 2rem;
    font-weight: 700;
    font-size: 1rem;
    color: ${Theme.secondaryColor};
    margin-right: auto;
  }

  li {
    cursor: pointer;
    &:hover {
      color: white;
    }
  }

  ${media.mobile} {
    ul {
        margin: 3rem 0 2rem 0rem;
        flex-direction: column;
        align-items: left;
        font-size: 1.5rem;
    }
  }
`; 

export const NavOptions: React.FC = () => {  
  return (
    <NavOptionsStyled className='nav-buttons'>
        <ul>
            <li><Link to="/" style={{ color: location.pathname === '/' ? 'white' : '' }}>Home</Link></li>
            <li><Link to="/plans" style={{ color: location.pathname === '/plans' ? 'white' : '' }}>Planos</Link></li>
            <li><Link to="/faq" style={{ color: location.pathname === '/faq' ? 'white' : '' }}>FAQ</Link></li>
        </ul> 
    </NavOptionsStyled>
  );
};
