import { Carousel } from "@/shared/components/Carousel";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const placeholders = [
  "https://placehold.co/800x400/e9ecef/495057",
  "https://placehold.co/800x400/e9ecef/495057",
  "https://placehold.co/800x400/e9ecef/495057",
];

export function CarouselPage() {
  return (
    <DemoPageShell
      title="Carousels & Slideshows"
      subtitle="Create easy and beautiful slideshows with these React components."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <DemoSection title="Basic Bootstrap 5 Carousel">
          <Carousel images={placeholders} autoPlay />
        </DemoSection>

        <DemoSection title="Carousel with Captions">
          <Carousel
            fade
            autoPlay
            slides={[
              {
                image: placeholders[0],
                captionTitle: "First Slide",
                captionText:
                  "Praesent commodo cursus magna, vel scelerisque nisl consectetur.",
              },
              {
                image: placeholders[1],
                captionTitle: "Second Slide",
                captionText:
                  "Nulla vitae elit libero, a pharetra augue mollis interdum.",
              },
              {
                image: placeholders[2],
                captionTitle: "Third Slide",
                captionText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
              },
            ]}
          />
        </DemoSection>
      </div>
    </DemoPageShell>
  );
}
