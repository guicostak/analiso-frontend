import React from 'react';
import styled from 'styled-components';
import { Header } from '../components/Header'
import { Helmet } from 'react-helmet';
import { Fold } from '../components/Fold';
import { Theme } from '../common/styles/Theme';
import { Titulo } from '../components/Titulo';
import { Button } from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '../common/util/iconUtils';
import { useNavigate } from '../common/util/routerUtils';
import { Flex } from '../components/Flex';
import media from '../common/styles/MediaScreens';
import telefones from '../assets/img/home/telefonesAcessando.png'
import { View } from '../components/View';
import dividendos from '../assets/img/home/carousel/dividendos.png';
import dividendosIcon from '../assets/img/home/carousel/icons/hand-holding-dollar-solid.png';
import forecastIcon from '../assets/img/home/carousel/icons/magnifying-glass-dollar-solid.png';
import forecast from '../assets/img/home/carousel/forecast.png';
import { Photo, Carousel } from '../components/Carousel';

const HomeContainer = styled.main`
  p {
    font-size: 1.2rem;
    color: ${Theme.secondaryColor};
    margin-bottom: 2rem;
    font-weight: 300; 
    width: 32rem;
  }

  .imagens-dobras {
    width: 36rem;
  }

  .img-wrap {
    display: flex;
    height: 100%;
    justify-content: end;
    align-items: end;
  }

  ${media.mobile} { 
    p {
      font-size: 1rem;
      width: auto;
    }

    .imagens-dobras {
      width: 20rem;
    }
  }
`;

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const photoData: Photo[] = [
    {
      id: '1',
      url: dividendos,
      alt: 'Description of Photo 1',
      title: 'Análise de dividendos',
      icon: dividendosIcon,
    },
    {
      id: '2',
      url: forecast,
      alt: 'Description of Photo 2',
      title: 'Previsão de ganhos',
      icon: forecastIcon,
    },
  ];

  return (
    <HomeContainer>
      <Helmet>
        <title>Analiso - Um jeito novo de analisar ações</title>
      </Helmet>
      <Header />
      <Flex $direction={'column'} $align={'left'} $width={'100%'}>
        <Fold  $height='40rem' $backgroundcolor={Theme.mainBackground}>
          <Flex $direction={'column'} $align={'left'}>
            <Titulo $textcolor={Theme.primaryColor}>Uma nova forma <br/> de analisar seus ativos</Titulo>
            <p>
              Feito para você analisar da melhor forma sua carteira de investimentos
            </p>
            <Button
              height={'2.7rem'}
              $border={'none'}
              onClick={() => navigate("/dashboard")}
              $textcolor={'white'}
              $background={Theme.primaryColor}
              width='25rem'
            >
              <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem' }} /> Cadastre-se agora
            </Button>
          </Flex>
          <View $view='desktop'>
            <Flex $direction={'row'} $align={'end'} $justify={'end'} $width={'100%'}>
              <img src={telefones} alt="" className='imagens-dobras'/>
            </Flex>
          </View>
          <View $view='mobile'>
            <Flex $direction={'column'} $align={'end'} $justify={'end'} $width={'100%'}>
              <img src={telefones} alt="Telefone usando o sistema" className='imagens-dobras'/>
            </Flex>
          </View>
        </Fold>
        <Fold $backgroundcolor={Theme.secondaryColor}>
          <Flex $direction={'column'}>
            <Titulo $textcolor={Theme.primaryColor}>Identifique boas oportunidades</Titulo>
            <p style={{color: 'white', width: 'auto'}}>          
              Uma análise abrangente da ação, fornecendo uma visão de todos os aspectos do negócio
            </p>
            <Carousel photos={photoData}/>
          </Flex>
        </Fold>
      </Flex>
    </HomeContainer>
  );
};
