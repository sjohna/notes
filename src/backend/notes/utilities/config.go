package utilities

import "github.com/spf13/viper"

type ApplicationConfig struct {
	DBHost       string
	DBPort       int32
	DBUser       string
	DBPassword   string
	DBName       string
	DBSSLMode    string
	APIPort      int32
	LogDirectory string
}

func GetConfigFromEnvFile(envFileName string) (*ApplicationConfig, error) {
	viper.SetConfigFile(envFileName)
	err := viper.ReadInConfig()
	if err != nil {
		return nil, err
	}

	return &ApplicationConfig{
		viper.GetString("DB_HOST"),
		viper.GetInt32("DB_PORT"),
		viper.GetString("DB_USER"),
		viper.GetString("DB_PASSWORD"),
		viper.GetString("DB_NAME"),
		viper.GetString("DB_SSL_MODE"),
		viper.GetInt32("API_PORT"),
		viper.GetString("LOG_DIR"),
	}, nil
}
