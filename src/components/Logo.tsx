import { useState } from "react";
import styled from "styled-components";

// Shows /public/ras-logo.png; if the file is missing or fails to load,
// falls back to the "RAS" text so the header never shows a broken image.
export function Logo() {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) return <TextLogo>RAS</TextLogo>;

  return <Image src="/ras-logo.webp" alt="RAS" onError={() => setImageFailed(true)} />;
}

const Image = styled.img`
  height: 32px;
  display: block;
`;

const TextLogo = styled.span`
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.accent};
`;
