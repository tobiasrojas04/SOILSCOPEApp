import { View, StyleSheet, Text } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { G, Path, Ellipse } from 'react-native-svg';
import { useFonts, Nunito_900Black } from '@expo-google-fonts/nunito';

type Props = { width?: number };

export default function SoilscopeLogo({ width = 360 }: Props) {
  const [loaded] = useFonts({ Nunito_900Black });
  if (!loaded) return null;

  // proporciones: alto aprox 0.27 * width
  const height = Math.round(width * 0.27);

  return (
    <View style={{ width, height }}>
      {/* Texto con degradé usando máscara */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <Text
              style={{
                fontFamily: 'Nunito_900Black',
                fontSize: Math.round(height * 0.58),
                letterSpacing: -0.5,
                color: 'black',
              }}
            >
              Soilscope
            </Text>
          </View>
        }
      >
        {/* degradé principal con una “franja” clara al centro */}
        <LinearGradient
          colors={['#1c7f3a', '#34c759', '#b8ff6a', '#34c759', '#1c7f3a']}
          locations={[0, 0.28, 0.5, 0.72, 1]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.8 }}
          style={StyleSheet.absoluteFill}
        />
      </MaskedView>

      {/* Hojitas (vector) sobre la “o” final */}
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={StyleSheet.absoluteFill}
      >
        <G
          // posicionamos las hojas cerca de la “o” final (ajustable)
          x={width * 0.675}
          y={height * 0.12}
          rotation={0}
        >
          {/* tallo */}
          <Path
            d={`M ${width*0.015} ${height*0.10}
               C ${width*0.02} ${height*0.18}, ${width*0.02} ${height*0.22}, ${width*0.018} ${height*0.28}`}
            stroke="#1f8f46"
            strokeWidth={Math.max(2, width * 0.003)}
            fill="none"
          />
          {/* hoja izquierda */}
          <Path
            d={`M 0 ${height*0.18}
               C ${-width*0.03} ${height*0.12}, ${-width*0.06} ${height*0.08}, ${-width*0.085} ${height*0.14}
               C ${-width*0.07} ${height*0.18}, ${-width*0.035} ${height*0.2}, 0 ${height*0.18} Z`}
            fill="#34c759"
          />
          {/* hoja derecha */}
          <Path
            d={`M ${width*0.03} ${height*0.18}
               C ${width*0.06} ${height*0.12}, ${width*0.085} ${height*0.06}, ${width*0.10} ${height*0.12}
               C ${width*0.08} ${height*0.18}, ${width*0.05} ${height*0.21}, ${width*0.03} ${height*0.18} Z`}
            fill="#2fb24f"
          />
          {/* brillo simple en hojas */}
          <Ellipse
            cx={-width*0.045}
            cy={height*0.145}
            rx={width*0.018}
            ry={height*0.02}
            fill="rgba(255,255,255,0.22)"
            rotation={-20}
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
