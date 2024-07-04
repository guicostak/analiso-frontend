import { carouselItems } from "../common/mock-bff/carouselMock";

export const useCarousel = () => {
  const getCarouselItems = () => {
    return carouselItems;
  };

  return {
    getCarouselItems
  };
};
