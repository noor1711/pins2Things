import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const dummyProducts = [
  {
    id: 1,
    title: "Kawaii Cat Plushie",
    image: "/placeholder.svg?height=200&width=200",
    price: "$24.99",
    link: "/products/cat-plushie",
  },
  {
    id: 2,
    title: "Rainbow Unicorn Mug",
    image: "/placeholder.svg?height=200&width=200",
    price: "$18.50",
    link: "/products/unicorn-mug",
  },
  {
    id: 3,
    title: "Pastel Bear Keychain",
    image: "/placeholder.svg?height=200&width=200",
    price: "$12.99",
    link: "/products/bear-keychain",
  },
  {
    id: 4,
    title: "Cute Panda Notebook",
    image: "/placeholder.svg?height=200&width=200",
    price: "$15.75",
    link: "/products/panda-notebook",
  },
  {
    id: 5,
    title: "Bunny Ear Headband",
    image: "/placeholder.svg?height=200&width=200",
    price: "$22.00",
    link: "/products/bunny-headband",
  },
];

const StyledCarousel = ({ items = dummyProducts }) => {
  return items?.length > 0 ? (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-pink-600 mb-2">
          {"✨ Product Recommendations ✨"}
        </h2>
        <p className="text-gray-600">Discover our adorable products!</p>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full p-2"
      >
        <CarouselContent>
          {items?.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="border-gray-200 rounded-lg">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={item?.image || "/placeholder.svg"}
                      alt={item?.title}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    {/* <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-md"
                    >
                      <Heart className="h-4 w-4 text-pink-500" />
                    </Button> */}
                    {/* <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">4.9</span>
                    </div> */}
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                      {item?.title}
                    </h3>

                    <Link href={item?.link} className="block">
                      <Button className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-full py-2 font-medium shadow-md hover:shadow-lg transition-all duration-200">
                        {"Buy Now ♡"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="bg-white/90 hover:bg-white border-pink-200 text-pink-600 shadow-lg rounded-full h-12 w-12" />
        <CarouselNext className="bg-white/90 hover:bg-white border-pink-200 text-pink-600 shadow-lg rounded-full h-12 w-12" />
      </Carousel>

      {/* <div className="text-center mt-8">
        <Link href="/products">
          <Button
            variant="outline"
            className="rounded-full border-pink-300 text-pink-600 hover:bg-pink-50 px-8 bg-transparent"
          >
            {"View All Products →"}
          </Button>
        </Link>
      </div> */}
    </div>
  ) : (
    <></>
  );
};

export default StyledCarousel;
