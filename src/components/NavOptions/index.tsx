import React from 'react';
import { Link, useLocation } from '../../common/util/imports/routerUtilsImports';
import { Options, Option } from './styles';

const NavOptions: React.FC = () => {
  const location = useLocation();

  return (
    <Options>
      <Option>
        <Link to="/" style={{ color: location.pathname === '/' ? 'white' : '' }}>
          Home
        </Link>
      </Option>
      <Option>
        <Link to="/plans" style={{ color: location.pathname === '/plans' ? 'white' : '' }}>
          Planos
        </Link>
      </Option>
      <Option>
        <Link to="/faq" style={{ color: location.pathname === '/faq' ? 'white' : '' }}>
          FAQ
        </Link>
      </Option>
    </Options>
  );
};

export default NavOptions;
