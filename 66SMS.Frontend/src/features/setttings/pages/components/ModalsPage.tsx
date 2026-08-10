import { useState } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const longBody = Array.from({ length: 12 }, (_: unknown, index: number) => (
  <p key={index} className="mb-3">
    Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in,
    egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Praesent
    commodo cursus magna, vel scelerisque nisl consectetur et.
  </p>
));

export function ModalsPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [longOpen, setLongOpen] = useState(false);
  const [largeOpen, setLargeOpen] = useState(false);
  const [smallOpen, setSmallOpen] = useState(false);

  const footer = (onClose: () => void) => (
    <>
      <Button variant="secondary" className="mb-0" onClick={onClose}>
        Close
      </Button>
      <Button variant="primary" className="mb-0" onClick={onClose}>
        Save changes
      </Button>
    </>
  );

  return (
    <DemoPageShell
      title="Modals"
      subtitle="Wide selection of modal dialogs styles and animations available."
    >
      <DemoSection title="Basic Examples">
        <Button variant="primary" className="me-2 mb-2" onClick={() => setBasicOpen(true)}>
          Basic Modal
        </Button>
        <Button variant="primary" className="me-2 mb-2" onClick={() => setLongOpen(true)}>
          Long Content
        </Button>
        <Button variant="primary" className="me-2 mb-2" onClick={() => setLargeOpen(true)}>
          Large modal
        </Button>
        <Button variant="primary" className="me-2 mb-2" onClick={() => setSmallOpen(true)}>
          Small modal
        </Button>
      </DemoSection>

      <Modal
        open={basicOpen}
        onClose={() => setBasicOpen(false)}
        title="Modal title"
        footer={footer(() => setBasicOpen(false))}
      >
        <p className="mb-0">
          Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when
          an unknown printer took a galley of type and scrambled.
        </p>
      </Modal>

      <Modal
        open={longOpen}
        onClose={() => setLongOpen(false)}
        title="Modal title"
        scrollable
        footer={footer(() => setLongOpen(false))}
      >
        {longBody}
      </Modal>

      <Modal
        open={largeOpen}
        onClose={() => setLargeOpen(false)}
        title="Modal title"
        size="lg"
        footer={footer(() => setLargeOpen(false))}
      >
        <p>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
          in, egestas eget quam.
        </p>
        <p className="mb-0">
          Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis
          lacus vel augue laoreet rutrum faucibus dolor auctor.
        </p>
      </Modal>

      <Modal
        open={smallOpen}
        onClose={() => setSmallOpen(false)}
        title="Modal title"
        size="sm"
        footer={footer(() => setSmallOpen(false))}
      >
        <p className="mb-0">
          Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis
          lacus vel augue laoreet rutrum faucibus dolor auctor.
        </p>
      </Modal>
    </DemoPageShell>
  );
}
