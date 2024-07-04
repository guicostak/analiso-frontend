import React from 'react';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/Header';
import Fold from '../../components/Fold';
import { Theme } from '../../common/styles/Theme';
import Button from '../../components/Button';
import { faUser, faArrowTrendUp } from '../../common/util/imports/iconUtilsImports';
import { useNavigate } from '../../common/util/imports/routerUtilsImports';
import Flex from '../../components/Flex';
import { Carousel } from '../../components/Carousel';
import telefones from '../../assets/img/home/telefonesAcessando.png';
import View from '../../components/View';
import {
  HomeContainer, PhoneImage, Subtitle, Title,
} from './styles';
import { useCarousel } from '../../hooks/useCarousel';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { getCarouselItems } = useCarousel();
  const items = getCarouselItems();
  
  return (
    <HomeContainer>
      <Helmet>
        <title>Analiso - Um jeito novo de analisar ações</title>
      </Helmet>

      <Header />
      <Flex $direction="column" $align="left" $width="100%">

        <Fold $height="40rem" $backgroundcolor={Theme.mainBackground}>
          <View $view="desktop">
            <Flex $direction="column" $align="left">
              <Title>
                Uma nova forma de analisar seus ativos
              </Title>
              <Subtitle style={{ marginBottom: '2rem' }}>
                Feito para você analisar da melhor forma sua carteira de investimentos
              </Subtitle>
              <Button
                height="2.7rem"
                $border="none"
                onClick={() => navigate('/dashboard')}
                $textcolor="white"
                $background={Theme.primaryColor}
                width="25rem"
              >
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem' }} />
                Cadastre-se agora
              </Button>
            </Flex>
            <Flex $direction="row" $align="end" $justify="end" $width="100%">
              <PhoneImage src={telefones} alt="Telefone usando o sistema" />
            </Flex>
          </View> 

          <View $view="mobile tablet">
            <Flex $direction="column" $align="left">
              <Title>
                Uma nova forma de analisar seus ativos
              </Title>
              <Subtitle style={{ marginBottom: '2rem' }}>
                Feito para você analisar da melhor forma sua carteira de investimentos
              </Subtitle>
              <Button
                height="2.7rem"
                $border="none"
                onClick={() => navigate('/dashboard')}
                $textcolor="white"
                $background={Theme.primaryColor}
                width="25rem"
              >
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem' }} />
                Cadastre-se agora
              </Button>
              <Flex $height='60%' $direction="column" $align="center" $justify="end" $width="100%"  $wrap='wrap'>
                <PhoneImage src={telefones} alt="Telefone usando o sistema" />
              </Flex>
            </Flex>
          </View>
        </Fold>
        

        <Fold $backgroundcolor={Theme.secondaryColor}>
          <Flex $direction="column" $wrap='none'>
            <Subtitle style={{ color: 'white', marginTop: '4rem'}}>
              <FontAwesomeIcon icon={faArrowTrendUp} style={{ marginInline: '0.7rem' }} />
              Relatórios de ações
            </Subtitle>

            <Title>Identifique boas oportunidades</Title>
            <Subtitle style={{ color: 'white'}}>
              Uma análise abrangente da ação, fornecendo uma visão de todos os aspectos do negócio
            </Subtitle>
            <Carousel photos={items} />

            <Flex $direction="row" $width='60%'>
              <Flex $direction="column">
                <h1 style={{color: 'white'}}>300</h1>
                <p style={{color: 'white'}}>ações</p>
              </Flex>  
              <Flex $direction="column">
                <h1 style={{color: 'white'}}>300</h1>
                <p style={{color: 'white'}}>ações</p>
              </Flex> 
              <Flex $direction="column">
                <h1 style={{color: 'white'}}>300</h1>
                <p style={{color: 'white'}}>ações</p>
              </Flex> 
            </Flex>
          </Flex>
        </Fold>

      </Flex>
    </HomeContainer>
  );
};

export default Home;
