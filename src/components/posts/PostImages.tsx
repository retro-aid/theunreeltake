import { Grid, GridCol, Image } from "@mantine/core";

export function PostImages({ urls, title }: { urls: string[]; title: string }) {
  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return <Image alt={title} src={urls[0]} w={640} maw={"100%"} mx={"auto"} style={{ aspectRatio: "16 / 9" }}/>;
  }

  return (
    <Grid align="flex-start" columnGap={"xs"}>
      {urls.map((url, index) => (
        <GridCol key={index} span={{ base: 12, md: 6 }}>
          <Image alt={`${title} image ${index + 1}`} style={{aspectRatio: "16 / 9" }} src={url} />
        </GridCol>
      ))}
    </Grid>
  );
}
