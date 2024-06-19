import { useSWRConfig } from "swr";

export const useMatchMutate = () => {
  const { cache, mutate } = useSWRConfig();

  return (matcher: string, ...args: any) => {
    if (!(cache instanceof Map)) {
      throw new Error(
        "matchMutate requires the cache provider to be a Map instance"
      );
    }

    const keys: any[] = [];

    //@ts-ignore
    for (const key of cache.keys()) {
      if (key.includes(matcher)) {
        keys.push(key);
      }
    }

    const mutations = keys.map((key) => mutate(key, ...args));
    return Promise.all(mutations);
  };
};
