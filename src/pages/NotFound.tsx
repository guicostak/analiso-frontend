import React from 'react';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  text-align: center;
  margin-top: 50px;
`;

const NotFoundHeading = styled.h2`
  color: #f00;
`;

const NotFoundMessage = styled.p`
  color: #333;
`;

export const NotFound: React.FC = () => (
  <NotFoundContainer>
    <NotFoundHeading>404 - Not Found</NotFoundHeading>
    <NotFoundMessage>Sorry, the page you are looking for does not exist.</NotFoundMessage>
  </NotFoundContainer>
);
