import NftCards from "./nftCards";
import { Container, Typography, Box } from '@mui/material';

function Explore(){


    return (
        <Container>
          <Box mt={4}>
            <Typography variant="h3" align="center">
                  Explore
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" mt={4}>
            <NftCards />
          </Box>
          <Box display="flex" justifyContent="center" mt={4}>
          </Box>
        </Container>
    );

}

export default Explore;