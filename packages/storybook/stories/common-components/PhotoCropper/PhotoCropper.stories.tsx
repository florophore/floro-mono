import { useState } from "react";
import PhotoCropper from "./index";
import MockImage from "./mock64";

const src = `data:image/png;base64, ${MockImage}`;

export default {
  title: "floro-app/common-components/PhotoCropper",
  component: PhotoCropper,
  argTypes: {},
};

const Template = (args) => {
  const [show, setShow] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div>
      <PhotoCropper
        {...args}
        isLoading={isLoading}
        show={show}
        onCancel={() => setShow(false)}
        title={"Crop Profile Picture"}
        onSave={() => {
          setIsLoading(true);
          setTimeout(() => {
            setShow(false);
          }, 1000);
        }}
      />
      <button
        onClick={() => {
          setShow(true);
          setIsLoading(false);
        }}
      >
        {"show"}
      </button>
    </div>
  );
};

export const Primary: any = Template.bind({});
Primary.args = {
  src,
};
