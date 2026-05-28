import styled from "styled-components";

export const ToggleButton = styled.button`
  display: block;
  font-size: 1rem;
  width: 8rem;
  border: none;
  color: #fff;
  height: 3rem;
  color: #fff;
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: ${({ theme }) => theme.toggleBtn};
  transition: 0.3s;

  margin-top: 1rem;
  &:hover {
    transform: scale(1.05);
  }
`;

export const HomeContainer = styled.div`
  max-width: 900px;
  width: 100%;
  padding: 2rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2px;

  h1 {
    text-align: center;
    font-family: "Times New Roman";
    font-size: 2rem;
  }

  background: ${({ theme }) => theme.container};
  transition: 0.3s;
`;
