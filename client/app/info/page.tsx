import Counter from "@/components/Counter"
import Form from "@/components/Form";
import Image from "next/image";
const url = "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU";

const page = () => {
  return (
    <>
    <div>page
      <Counter />
      <hr/>
      <Image
        src={url}
        width={400}
        height={400}
        alt={"Kira"}
        priority
      />
    </div>
    <div>
      <Form/>
    </div>
    </>
  );
};
export default page