import { BlurFade } from "./magicui/blur-fade";
import { Card } from "./ui/card";

const MenuCard = ({ index, item, className, textcolor, onCardClick }) => {
  return (
    <BlurFade
      delay={0.25 * index}
      inView
      className="flex flex-col gap-2 justify-center items-center self-stretch w-full min-w-60 tl6:p-2"
    >
      <Card
        className={`flex flex-col flex-grow gap-2 justify-center items-center self-stretch p-2 shadow-xl cursor-pointer ${className}`}
        onClick={() => onCardClick(item)}
      >
        <div className="flex flex-grow gap-2 justify-center items-center self-stretch p-2">
          <div className="grid flex-grow grid-rows-3 py-2 space-y-4 md:py-6">
            <div className="flex row-span-1 justify-center items-center w-full">
              <div className="w-24 h-24 tl6:w-28 tl6:h-28 aspect-square">
                <img
                  src={`/images/${item.name}.svg`}
                  alt={item.name}
                  className="aspect-square"
                />
              </div>
            </div>
            <div className="flex flex-col row-span-1 items-center text-center opacity-80 tl6:text-xl">
              <p>{item.description[0]}</p>
              <p>{item.description[1]}</p>
            </div>
            <div
              className={`flex flex-col row-span-1 justify-center self-stretch text-4xl font-extrabold leading-none text-center md:text-6xl tl6:text-6xl ${textcolor}`}
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
