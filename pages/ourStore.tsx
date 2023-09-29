import type { NextPage } from "next";
import Layout from "@components/layout";
import { readFileSync } from "fs";
import matter from "gray-matter";

interface StorePost {
  title: string
  location: string
  content: string
}

const OurStore: NextPage<{storePost: StorePost}> = ({storePost}) => {
  return (
    <Layout hasTabBar title="Profile">
      <div className="bg-white w-full p-2 md:min-h-[38rem]">
        <div className="max-w-3xl mx-auto py-8 px-4 md:px-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            {storePost.title}
          </h1>
          <p className="text-lg text-center mb-8">
            {storePost.location}
          </p>
          <p className="text-center mb-8">
            {storePost.content}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export async function getStaticProps(){

  const storePosts = readFileSync(`./posts/storeInformation.md`, "utf-8");
  return {
    props: {
      storePost: matter(storePosts).data
    }
  }
}

export default OurStore;
