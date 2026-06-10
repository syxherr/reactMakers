import { Component } from "react";
import styled from "styled-components";

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  min-height: 140px;
  color: var(--color-muted);
  font-size: 0.875rem;
  background: var(--bg-poke-card);
  text-align: center;
`;

export default class ErrorBoundary extends Component{
    constructor(props) {
        super(props);
        this.state = { hasError: false }; // ganti
    }

    static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("PokemonCard error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorWrapper role="alert">
          <span>Oh no! The Pokémon broke out of the ball (ᗒᗣᗕ)՞</span>
        </ErrorWrapper>
      );
    }

    return this.props.children;
  }
}