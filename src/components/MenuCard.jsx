import { BlurFade } from "./magicui/blur-fade";
import { Card } from "./ui/card";

const MenuCard = ({ index, item, className, textcolor, onCardClick }) => {
  return (
    <BlurFade
      delay={0.25 * index}
      inView
      className="flex flex-col items-center self-stretch justify-center w-full gap-2 min-w-60 tl6:p-2"
    >
      <Card
        className={`flex p-2 flex-col justify-center items-center gap-2 flex-grow self-stretch shadow-xl ${className}`}
        onClick={() => onCardClick(item)}
      >
        <div className="flex items-center self-stretch justify-center flex-grow gap-2 p-2">
          <div className="grid flex-grow grid-rows-3 py-2 space-y-4 md:py-6">
            <div className="flex items-center justify-center w-full row-span-1">
              <div className="w-24 h-24 tl6:w-28 tl6:h-28 aspect-square">
                <img
                  src={`/images/${item.name}.svg`}
                  alt={item.name}
                  className="aspect-square"
                />
              </div>
            </div>
            <div className="flex flex-col items-center row-span-1 text-center opacity-80 tl6:text-xl">
              <p>{item.description[0]}</p>
              <p>{item.description[1]}</p>
            </div>
            <div
              className={`row-span-1 text-4xl md:text-6xl tl6:text-6xl font-extrabold text-center leading-none flex flex-col justify-center self-stretch ${textcolor}`}
            >
              {item.title}
            </div>
          </div>
        </div>
      </Card>
    </BlurFade>
  );
};

export default MenuCard;
