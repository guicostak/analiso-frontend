import { Item } from '../../components/Carousel';
import dividendos from '../../assets/img/home/carousel/dividendos.png';
import dividendosIcon from '../../assets/img/home/carousel/icons/hand-holding-dollar-solid.png';
import forecastIcon from '../../assets/img/home/carousel/icons/magnifying-glass-dollar-solid.png';
import forecast from '../../assets/img/home/carousel/forecast.png';

const carouselItems: Item[] = [
  {
    id: '1',
    url: dividendos,
    alt: 'Description of Photo 1',
    title: 'Análise de dividendos',
    icon: dividendosIcon,
    description: 'A snapshot of critical red-flags and opportunities',
  },
  {
    id: '2',
    url: forecast,
    alt: 'Description of Photo 2',
    title: 'Previsão de ganhos',
    icon: forecastIcon,
    description: 'A snapshot of critical red-flags and opportunities',
  },
  {
    id: '3',
    url: dividendos,
    alt: 'Description of Photo 2',
    title: 'Previsão de ganhos',
    icon: forecastIcon,
    description: 'A snapshot of critical red-flags and opportunities',
  },
  {
    id: '4',
    url: forecast,
    alt: 'Description of Photo 2',
    title: 'Previsão de ganhos',
    icon: forecastIcon,
    description: 'A snapshot of critical red-flags and opportunities',
  },
];

export default carouselItems;
